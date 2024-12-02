import os
import cv2
import numpy as np
import mediapipe as mp
import tensorflow as tf
import copy
import itertools
import string
import pandas as pd
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

class SignLanguageRecognizer:
    def __init__(self, model_path: str):
        self.mp_hands = mp.solutions.hands
        self.mp_drawing = mp.solutions.drawing_utils

        try:
            self.hands = self.mp_hands.Hands(
                model_complexity=0,
                max_num_hands=2,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
        except Exception as e:
            print(f"MediaPipe initialization error: {e}")
        
        try:
            self.model = tf.keras.models.load_model(model_path)
            print("Model loaded successfully!")
        except Exception as e:
            print(f"Error loading model: {e}")

        self.alphabet = ['1','2','3','4','5','6','7','8','9'] + list(string.ascii_uppercase)
        self.translations = {
            'English': {},
            'Hindi': {},
            'Marathi': {},
            'Gujarati': {},
            'Bengali': {},
            'Tamil': {},
            'Telugu': {},
            'Kannada': {},
            'Malayalam': {}
        }

        for char in self.alphabet:
            for lang in self.translations.keys():
                self.translations[lang][char] = char

    def calc_landmark_list(self, image: np.ndarray, landmarks) -> list:
        image_width, image_height = image.shape[1], image.shape[0]
        landmark_point = []
        
        for landmark in landmarks.landmark:
            landmark_x = min(int(landmark.x * image_width), image_width - 1)
            landmark_y = min(int(landmark.y * image_height), image_height - 1)
            landmark_point.append([landmark_x, landmark_y])
            
        return landmark_point

    def pre_process_landmark(self, landmark_list: list) -> list:
        temp_landmark_list = copy.deepcopy(landmark_list)

        base_x, base_y = temp_landmark_list[0]
        for point in temp_landmark_list:
            point[0] = point[0] - base_x
            point[1] = point[1] - base_y

        temp_landmark_list = list(itertools.chain.from_iterable(temp_landmark_list))
        max_value = max(map(abs, temp_landmark_list))
        temp_landmark_list = [n / max_value for n in temp_landmark_list]
        
        return temp_landmark_list

    def process_frame(self, frame: np.ndarray, selected_language: str = 'English') -> dict:
        frame = cv2.flip(frame, 1)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.hands.process(frame_rgb)

        prediction_result = {
            'predicted_char': None,
            'translated_text': None
        }

        if results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, 
                                                  results.multi_handedness):
                landmark_list = self.calc_landmark_list(frame, hand_landmarks)
                preprocessed_landmarks = self.pre_process_landmark(landmark_list)
                df = pd.DataFrame(preprocessed_landmarks).transpose()
                predictions = self.model.predict(df, verbose=0)
                predicted_class = np.argmax(predictions, axis=1)[0]
                predicted_char = self.alphabet[predicted_class]
                translated_text = self.translations[selected_language].get(predicted_char, predicted_char)

                prediction_result['predicted_char'] = predicted_char
                prediction_result['translated_text'] = translated_text
                
                break  # Process only the first hand
        
        return prediction_result


# Initialize recognizer (update the model path)
recognizer = SignLanguageRecognizer(model_path='/home/avinash/Documents/Sanketuvach-mobile/server/models/model.h5')

# Create Flask app
app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict_sign():
    """Endpoint to predict sign language from an uploaded image"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        
        filename = secure_filename(file.filename)
        contents = file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({"error": "Invalid image"}), 400

        language = request.form.get('language', 'English')
        result = recognizer.process_frame(frame, language)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/languages", methods=["GET"])
def get_supported_languages():
    """Return list of supported languages"""
    return jsonify(list(recognizer.translations.keys()))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

from flask import Flask, request, jsonify
import numpy as np
import tensorflow as tf
import wave

app = Flask(__name__)

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()


def preprocess_audio(file):
    wf = wave.open(file, 'rb')
    signal = wf.readframes(-1)
    signal = np.frombuffer(signal, dtype=np.int16)

    # Resize / normalize based on your model
    signal = signal[:16000]  # example
    signal = signal / 32768.0

    return np.array(signal, dtype=np.float32)


@app.route("/predict", methods=["POST"])
def predict():
    file = request.files['file']
    audio = preprocess_audio(file)

    audio = np.expand_dims(audio, axis=0)

    interpreter.set_tensor(input_details[0]['index'], audio)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]['index'])

    result = "Distress" if output[0][0] > 0.5 else "Normal"

    return jsonify({"result": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)

CORS(app)

@app.route('/get-mindmap', methods=["POST"])
def get_model_results():
    data = request.get_json()

    # mindmap_nodes = ml_process(data) -> model function

    return data

if __name__ == "__main__":
    app.run(port=5000)
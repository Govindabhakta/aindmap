from flask import Flask, request, jsonify
from flask_cors import CORS
import NLP_process
import requests

app = Flask(__name__)

CORS(app)

@app.route('/get-mindmap', methods=["POST"])
def get_model_results():
    data = request.get_json()

    mindmap_nodes, node_links = NLP_process.process_text(data)

    return data

if __name__ == "__main__":
    app.run(port=5000)
from flask import Flask, request, jsonify
from flask_cors import CORS
import NLP_process
import requests
import json

app = Flask(__name__)

CORS(app)

class SetEncoder(json.JSONEncoder):
    def default(self, obj):
       if isinstance(obj, set):
          return list(obj)
       return json.JSONEncoder.default(self, obj)

@app.route('/get-mindmap', methods=["POST"])
def get_model_results():
    data = request.get_json()

    mindmap_nodes, node_links, summary_text, sentences_arr = NLP_process.process_text(data['text'], data['phrases_count'], data['title'])

    json_dump = json.dumps({
            'nodes': list(mindmap_nodes),
            'links': list(node_links),
            'summary_text': summary_text,
            'summary_arr': sentences_arr
        }, cls=SetEncoder)

    json_load = json.loads(json_dump)

    print(json_load)

    return jsonify(
        json_load
    )

if __name__ == "__main__":
    app.run(port=5000)
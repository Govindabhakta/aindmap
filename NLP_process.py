from spacy.lang.en.stop_words import STOP_WORDS
from collections import defaultdict
from nltk.corpus import stopwords
from spacy.lang.en import English
from rake_nltk import Rake
import en_core_web_sm
import numpy as np
import pytextrank
import spacy


nlp = spacy.load('en_core_web_sm')
nlp.add_pipe("textrank")

text = '''
From the beginning, Obama’s team was invested in constructing a certain image of what would be deemed a “historic” presidency. During Obama’s campaign, the artist Shepard Fairey, who designed the famous “Hope” poster, was widely acknowledged as his key iconographer. But, in retrospect, who Obama was and what he represented endures in the public imagination thanks to the work of the White House photographer Pete Souza, a longtime photojournalist who first had the assignment under Ronald Reagan. Over time, Souza helped create a new image of race in the US. This was an image of a postracial nation, where postracial didn’t mean liberation – it meant a US where race was solely affect and gesture, rather than the old brew of capital, land and premature death. Progress would deposit us in a place where black would be pure style – a style that the ruling class could finally wear out.
In the thick of the 2008 primary, in an essay titled Native Son, George Packer argued that after a half century when “rightwing populism has been the most successful political force in America”, there was finally hope for an alternative. “Obama is a black candidate,” he wrote, “who can tell Americans of all races to move beyond race.” The ensuing years bore out the impossibility of that widely held belief, but it was already evident in the language. How could a single person be black and capable of moving everybody beyond race?
'''


def generate_summary(text):
    doc = nlp(text)

    tr = doc._.textrank

    arr = []

    for sent in tr.summary(limit_phrases=20, preserve_order=True):
        arr.append(str(sent).replace("\n", ""))

    return arr


def GetKeywords(tex):
    rake = Rake()
    rake.extract_keywords_from_text(tex)

    KeywordList = rake.get_ranked_phrases_with_scores()

    FixedKeyword = []
    for index, tuple in enumerate(KeywordList):
        if tuple[0] > 1:
          tempstring = tuple[1]
          FixedKeyword.append(tempstring.replace('“ ', '“').replace(' ”', '”').replace(' ’', '’'))

    return FixedKeyword

def GetKeywordScore(tex):
    rake = Rake()
    rake.extract_keywords_from_text(tex)

    KeywordList = rake.get_ranked_phrases_with_scores()
    FixedScore = []

    for index, tuple in enumerate(KeywordList):
        if tuple[0] > 1:
          FixedScore.append(tuple[0])

    return FixedScore

def generate_graph(sentence, sent_arr):
    graph_dict = defaultdict(set)
    sentence_nlp = nlp(sentence)

    keywords_dict = get_keywords_dict(sent_arr)

    keywords = GetKeywords(" ".join(sent_arr))

    for sent in sentence_nlp.sents:

        keychunk = []

        for chunk in sent.noun_chunks:
            for word in keywords:
                if (word in chunk.text.lower()):
                    keychunk.append(word)

        for word in keychunk:
            for connect in keychunk:
                if (keywords_dict[word] > keywords_dict[connect]):
                    graph_dict[word].add(connect)

    popping_key = []
    
    for key1,values1 in graph_dict.items():
        for key2, values2 in graph_dict.items():
            if (key1 != key2) and (values1 == values2):
                tempstring = key1 + " & " + key2
                graph_dict[tempstring] = graph_dict.pop(key1)
                popping_key.append(key2)
            elif (key1 != key2) and (values1.issubset(values2)):
                graph_dict[key2].add(key1)
                popping_key.append(key1)
            elif (key1 != key2) and (values2.issubset(values1)):
                graph_dict[key1].add(key2)
                popping_key.append(key2)

    for key in popping_key:
        if(key in graph_dict):
            graph_dict.pop(key)

    return graph_dict


def get_keywords_dict(sent_arr):
    x2 = GetKeywords(" ".join(sent_arr))
    y2 = GetKeywordScore(" ".join(sent_arr))

    keywords_dict = dict(zip(x2, y2))

    return keywords_dict


def generate_nodes(graph_dict, sent_arr):
    keywords = GetKeywords(" ".join(sent_arr))

    keywords_dict = get_keywords_dict(sent_arr)

    nodes = []

    for key in graph_dict:
        node = {}
        node["id"] = key
        node["name"] = key
        node["val"] = keywords_dict[key]
        nodes.append(node)

    links = []

    for key in graph_dict.keys():
        link = {}
        link["source"] = "root"
        link["target"] = key
        links.append(link)

    for key, values in graph_dict.items():
      link = {}
      if (isinstance(values, set)):
        for value in values:
            link["source"] = key
            link["target"] = value
            links.append(link)
      else:
          link["source"] = key
          link["target"] = value
          links.append(link)

    return nodes, links


def process_text(text):
    sentences_arr = generate_summary(text)

    graph_dict = dict()

    for i in sentences_arr:
        graph_dict.update(generate_graph(i, sentences_arr))

    nodes, links = generate_nodes(graph_dict, sentences_arr)

    return nodes, links

# if __name__ == "__main__":
#     print(process_text(text))

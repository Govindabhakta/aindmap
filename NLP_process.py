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

def generate_summary(text, phrases_count=None):
    doc = nlp(text)

    tr = doc._.textrank

    arr = []

    limit_phrases = 20

    if phrases_count != None:
        limit_phrases = phrases_count

    for sent in tr.summary(limit_phrases=limit_phrases, preserve_order=True):
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
    relations_dict = {}
    sentence_dict = defaultdict()
    idxsentence_dict = {}

    idxSent = 0
    for i in sent_arr:
        idxsentence_dict[i] = idxSent
        idxSent = idxSent + 1

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
                    tokentuple = (word, connect)
                    relations_dict[tokentuple] = sent.root.orth_
                    if (word not in sentence_dict):
                        sentence_dict[word] = [sent.orth_]
                    else:
                        if(sent.orth_ not in sentence_dict[word]):
                            sentence_dict[word].append(sent.orth_)
                    if (connect not in sentence_dict):
                        sentence_dict[connect] = [sent.orth_]
                    else:
                        if (sent.orth_ not in sentence_dict[connect]):
                            sentence_dict[connect].append(sent.orth_)

    popping_key = []

    add = {}

    for key1, values1 in graph_dict.items():
        for key2, values2 in graph_dict.items():
            if (key1 != key2) and (values1 == values2):
                tempstring = key1 + " & " + key2
                add[tempstring] = graph_dict[key1] #Gw ubah soalnya error ganti key
                popping_key.append(key2)
                popping_key.append(key1)
            elif (key1 != key2) and (values1.issubset(values2)):
                graph_dict[key2].add(key1)
                popping_key.append(key1)
            elif (key1 != key2) and (values2.issubset(values1)):
                graph_dict[key1].add(key2)
                popping_key.append(key2)

    for key in popping_key:
        if (key in graph_dict):
            graph_dict.pop(key)

    MiddleArray = []
    for key in add:
        if('&' in key):
            MiddleArray.append(key)
            
    for key1 in MiddleArray:
        for key2 in MiddleArray:
            if ((key1 != key2) and (sorted(key1) == sorted(key2))):
                if(key2 in graph_dict.values()):
                    add.pop(key1)
                    MiddleArray.remove(key1)
                else:
                    add.pop(key2)
                    MiddleArray.remove(key2)
    
    graph_dict.update(add)

    for key in graph_dict: #Key = A & B
        if('&' in key):
            splitkey = key.split(" & ") #
            for i in splitkey:
                for value in graph_dict[key]:
                    temptuple = (i,value)
                    if(temptuple in relations_dict):
                        relations_dict[(key,value)] = relations_dict[temptuple]
                    if(i in sentence_dict):
                        sentence_dict[key] = sentence_dict[i]
                    if ('&' in value):
                        splitvalue = key.split(" & ")
                        for j in splitvalue:
                            if(j in sentence_dict):
                                sentence_dict[value] = sentence_dict[j]

    return graph_dict, relations_dict, sentence_dict, idxsentence_dict


def get_keywords_dict(sent_arr):
    x2 = GetKeywords(" ".join(sent_arr))
    y2 = GetKeywordScore(" ".join(sent_arr))

    keywords_dict = dict(zip(x2, y2))

    return keywords_dict


def generate_nodes(graph_dict, sent_arr, title, relations_dict, sentence_dict, idxsentence_dict):
    keywords = GetKeywords(" ".join(sent_arr))

    keywords_dict = get_keywords_dict(sent_arr)

    nodes = []

    rootnode = {}
    rootnode["id"] = title
    rootnode["name"] = title
    rootnode["val"] = "0"
    nodes.append(rootnode)

    i = 0

    for key in graph_dict:
        node = {}
        node["id"] = key
        node["name"] = key
        node["val"] = 1
        node["sentences"] = sentence_dict[key]
        indexarray = sentence_dict[key]
        node["sentences_index"] = []
        for el in indexarray:
            node["sentences_index"].append(idxsentence_dict[el])
        if(node not in nodes):
            nodes.append(node)
            i += 1
        for value in graph_dict[key]:
            node2 = {}
            node2["id"] = value
            node2["name"] = value
            node2["val"] = 2
            node2["sentences"] = sentence_dict[value]
            indexarray = sentence_dict[value]
            node2["sentences_index"] = []
            for el in indexarray:
                node2["sentences_index"].append(idxsentence_dict[el])
            if ((node2 not in nodes) and ((key,value) in relations_dict)):
                nodes.append(node2)
                i += 1

    links = []

    for key in graph_dict.keys():
      link = {}
      link["source"] = title
      link["target"] = key
      links.append(link)

    for key in graph_dict:
        for value in graph_dict[key]:
            link = {}
            link["source"] = key
            link["target"] = value
            if (key,value) in relations_dict:
                link["explanation"] = relations_dict[(key,value)]
            else:
                link["explanation"] = ""
            links.append(link)


    return nodes, links


def process_text(text, phrases_count, title):
    sentences_arr = generate_summary(text, phrases_count)

    summary_text = " ".join(sentences_arr)

    print(summary_text)

    graph_dict = dict()
    relations_dict = dict()
    sentence_dict = dict()
    idxsentence_dict = dict()

    for i in sentences_arr:
        gen = generate_graph(i, sentences_arr)
        graph_dict.update(gen[0])
        relations_dict.update(gen[1])
        sentence_dict.update(gen[2])
        idxsentence_dict.update(gen[3])

    nodes, links = generate_nodes(graph_dict, sentences_arr, title, relations_dict, sentence_dict, idxsentence_dict)

    return nodes, links, summary_text, sentences_arr

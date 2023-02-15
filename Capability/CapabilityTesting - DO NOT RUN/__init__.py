import CapabilityTesting.Server as s
import requests
from IPython.display import display, HTML
from threading import Thread
from time import sleep

class Capability:
    def __init__(self):
        self.topic = None
        self.port = 3003
        self.url = "http://localhost:{}/".format(self.port)
        Thread(target=s.launch, args=(self.port,)).start()
        sleep(1)

    def choose_topic(self, topic):
        self.topic = topic
        try:
            requests.get(self.url + "selectTopic/topic={}".format(topic), timeout=1)
        except Exception as e:
            print("Error: ", e)

            s.stop()
            s.launch(port = self.port)
            requests.get(self.url + "selectTopic/topic={}".format(topic), timeout=1)
    
    def __HTML__(self):
        return "<iframe src='./index.html' width='100%' height='400px' />".format(str(self.port))

    def display(self):
        display(HTML(self.__HTML__()))
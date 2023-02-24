import os
from IPython.core.display import display, HTML
import requests

class Capability(object):
    def __init__(self, topic="hate speech", build_directory="Build"):
        self.topic = topic
        self.build_directory = os.path.abspath(__file__).replace("Capability.py", build_directory)
        self.server_link = "http://localhost:3001"

    def get_css_file(self):
        content = ""
        css_directory = self.build_directory + "/static/css"
        for filename in os.listdir(css_directory):
            if filename.endswith(".css"):
                with open(css_directory + "/" + filename, "r") as f:
                    content += f.read()
        return content
    
    def get_js_file(self):
        content = ""
        js_directory = self.build_directory + "/static/js"
        for filename in os.listdir(js_directory):
            if filename.endswith(".js"):
                with open(js_directory + "/" + filename, "r") as f:
                    content += f.read()
        return content
    
    def get_html_file(self):
        if not self.check_if_server_is_running():
            content = """
            <div>
                <p>Backend server is not running. Kindly run the server and try again.</p>
            </div>
            """
            return content

        self.reset_state()
        content = """
        <div>
            <script>{}</script>
            <style>{}</style>
            <div id="root" style="min-height: 300px;"></div>
        <div>
        """
        js_file = self.get_js_file()
        css_file = self.get_css_file()
        return content.format(js_file, css_file)

    def check_if_server_is_running(self):
        try:
            requests.get(self.server_link)
            return True
        except:
            return False

    def reset_state(self):
        requests.get(self.server_link + "/resetState")

    def display(self):
        html_content = self.get_html_file()
        display(HTML(html_content))
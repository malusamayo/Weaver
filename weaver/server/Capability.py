import os
from IPython.core.display import display, HTML
import requests
import os
import sys

# module_path = os.path.abspath(os.path.join('..'))
# if module_path not in sys.path:
#     sys.path.append(module_path)

from .Server import CapabilityApp

class Capability(object):
    def __init__(self, topic="hate speech", build_directory="Build", file_directory: str="./output/", model_spec="", uid:str="", serverHost: str="localhost", serverPort: int=3001, overwrite: bool=False, generator_specs=None):
        self.topic = topic
        self.build_directory = os.path.abspath(__file__).replace("Capability.py", build_directory)
        self.server_link = f"http://{serverHost}:{serverPort}/"
        self.app = CapabilityApp(topic=self.topic, 
                                    file_directory=file_directory,
                                    model_dir=model_spec,
                                    serverHost=serverHost,
                                    serverPort=serverPort,
                                    uid=uid,
                                    overwrite=overwrite,
                                    generator_specs=generator_specs)
        self.app.initializeServer()

    def get_tree(self):
        return self.app.t.generate_json()

    def close(self):
        self.app.stopServer()

    def change_topic(self, topic, model_spec=None, generator_specs=None):
        self.topic = topic
        self.app.change_topic(topic, model_spec, generator_specs)

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
        content = content.replace("http://localhost:3001/", self.server_link)
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

    # def open_in_new_tab(self):
    #     html_content = self.get_html_file()
    #     tmp_html_path = "tmp.html"
    #     with open(tmp_html_path, "w") as f:
    #         f.write(html_content)
    #     display(HTML(f'<a href="tmp_html_path" target="_blank">Click to open the link</a>'))
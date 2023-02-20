import os

class Capability(object):
    def __init__(self, topic="hate speech", build_directory="Build"):
        self.topic = topic
        self.build_directory = os.path.abspath(__file__).replace("Capability.py", build_directory)

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
        content = """

        <div>
            <script>{}</script>
            <style>{}</style>
            <div id="root"></div>
        <div>
        """

        return content.format(self.get_js_file(), self.get_css_file())

    def display(self):
        from IPython.core.display import display, HTML
        display(HTML(self.get_html_file()))
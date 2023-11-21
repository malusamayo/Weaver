import os
from flask import Flask, send_from_directory

app = Flask(__name__, static_folder='build')

# Serve React App
@app.route('/app', defaults={'path': ''}) 
@app.route('/app/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


if __name__ == '__main__':
    app.run(use_reloader=True, port=5001, threaded=True)

# from fastapi import FastAPI
# import os
# from fastapi.staticfiles import StaticFiles

# app = FastAPI()

# # Serve the index.html file from the build folder
# app.mount("/", StaticFiles(directory="build"), name="static")

# # Serve the index.html file
# @app.get("/")
# def root():
#     print(os.getcwd())
#     return send_from_directory("build", 'index.html')

# # Serve all other static file

# #  uvicorn main:app --reload --port 3001
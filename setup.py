import glob
from setuptools import setup, find_packages
import os

os.chdir("frontend")
os.system("npm install")
os.system("npm run build")
os.chdir("..")

files = glob.glob('weaver/server/Build/static/css/*.css') + glob.glob('weaver/server/Build/static/js/*.js') + glob.glob('weaver/specs/*.json')
files = [f.replace("weaver/", "") for f in files]

setup(
    name="weaver",
    version='0.1.0',
    url="https://github.com/malusamayo/Weaver",
    packages=find_packages(exclude=["frontend"]),
    package_data= {
        'weaver': files
    },
    # [
    #     ('weaver/server/Build/static/css', glob.glob('weaver/server/Build/static/css/*.css')),
    #     ('weaver/server/Build/static/js', glob.glob('weaver/server/Build/static/js/*.js')),
    #     ('weaver/specs', glob.glob('weaver/specs/*.json'))
    # ],
    install_requires=[
        "fastapi",
        "ipython",
        "nltk",
        "numpy",
        "openai",
        "pandas",
        "pydantic",
        "requests",
        "tenacity",
        "tiktoken",
        "torch",
        "transformers",
        "uvicorn",
    ]
)
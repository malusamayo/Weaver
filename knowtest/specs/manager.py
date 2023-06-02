import importlib.resources
import json

class SpecManager(object):

    def __init__(self):
        pass

    @staticmethod
    def add_model_specs(spec: dict, overwrite: bool=False):
        '''
        Add model specs to the model specs file
        Spec format:
        {
            "MODEL_NAME": {
                "model": MODEL_ENDPOINT,
                "type": "classification" or "generation",
                "labels": ["label1", "label2", ...],
                "prompt": PROMPT,
            }
        }
        '''
        with importlib.resources.open_text("knowtest.specs", 'models.json') as file:
            model_prompts = json.load(file)
        for name, value in spec.items():
            if overwrite:
                model_prompts[name] = value
            else:
                if name not in model_prompts:
                    model_prompts[name] = value
                else:
                    raise ValueError(f"Spec {name} already exists. Use overwrite=True to overwrite.")
        with importlib.resources.path("knowtest.specs", 'models.json') as c:
            with c.open('w') as file:
                json.dump(model_prompts, file)
    
    @staticmethod
    def add_generator_specs(spec: dict, overwrite: bool=False):
        with importlib.resources.open_text("knowtest.specs", 'generators.json') as file:
            generator_prompts = json.load(file)
        for name, value in spec.items():
            if overwrite:
                generator_prompts[name] = value
            else:
                if name not in generator_prompts:
                    generator_prompts[name] = value
                else:
                    raise ValueError(f"Spec {name} already exists. Use overwrite=True to overwrite.")
        with importlib.resources.path("knowtest.specs", 'generators.json') as c:
            with c.open('w') as file:
                json.dump(generator_prompts, file)
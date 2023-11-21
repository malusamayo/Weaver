import importlib.resources
import json

class SpecManager(object):

    use_custom_relation_specs = False

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

    @staticmethod
    def specify_custom_relation_specs(spec: list, overwrite: bool=False):
        '''
        Use custom relation specs to the relation specs file.
        Spec is a list of relation, specified in a dict or a string.
        
        Specified in a dict:
            {
                "id": "TYPEOF",
                "tag": "has subtype",
                "description": {
                    "text": "is a type of",
                    "position": "second"
                },
                "prompt": "List {N} types of {topic}."
            }

        Specified in a string (when id exists in the default relation specs):
            "TYPEOF"
        '''
        SpecManager.use_custom_relation_specs = True
        with importlib.resources.open_text("knowtest.specs", 'relations_default.json') as file:
            default_relations = json.load(file)
        id2relation = {relation["id"]: relation for relation in default_relations}
        spec = [s if isinstance(s, dict) else id2relation[s] for s in spec]
        with importlib.resources.path("knowtest.specs", 'relations.json') as c:
            with c.open('w') as file:
                json.dump(spec, file)
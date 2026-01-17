import json
import importlib
import os

CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'clinics.json')

def load_clinic_config(clinic_id):
    with open(CONFIG_PATH, 'r') as f:
        clinics = json.load(f)
    return clinics.get(clinic_id)

def get_efax_adapter(provider_name, config):
    module = importlib.import_module(f'services.efax.{provider_name.lower()}')
    adapter_class = getattr(module, provider_name)
    return adapter_class(config)

def get_emr_adapter(provider_name, config):
    module = importlib.import_module(f'services.emr.{provider_name.lower()}')
    adapter_class = getattr(module, provider_name)
    return adapter_class(config)

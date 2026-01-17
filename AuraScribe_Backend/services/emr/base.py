class BaseEMRAdapter:
    def __init__(self, config):
        self.config = config

    def push_to_emr(self, data):
        raise NotImplementedError("push_to_emr must be implemented by subclass")

    def pull_from_emr(self, patient_id):
        raise NotImplementedError("pull_from_emr must be implemented by subclass")

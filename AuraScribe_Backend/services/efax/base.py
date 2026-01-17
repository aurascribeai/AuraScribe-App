class BaseEFaxAdapter:
    def __init__(self, config):
        self.config = config

    def send_fax(self, pdf_path, recipient_number):
        raise NotImplementedError("send_fax must be implemented by subclass")

    def receive_fax(self):
        raise NotImplementedError("receive_fax must be implemented by subclass")

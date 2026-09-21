import sys
from html.parser import HTMLParser

class MyHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.in_orders = False
        self.output = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        classes = attr_dict.get('class', '')
        if 'vtex-account' in classes or 'vtex-my-orders-app' in classes or 'tfg-custom-components' in classes:
            self.output.append(f"<{tag} class='{classes}'>")
    
    def handle_endtag(self, tag):
        pass

    def handle_data(self, data):
        data = data.strip()
        if data:
            self.output.append(data)

parser = MyHTMLParser()
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    parser.feed(f.read())

with open("output.txt", "w", encoding='utf-8') as f:
    for line in parser.output:
        f.write(line + "\n")

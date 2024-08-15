import requests
import json
import os

medium_username = "naveenkumarmurugan"
api_url = f"https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@{medium_username}"

response = requests.get(api_url)
data = response.json()

articles = []
for item in data['items']:
    articles.append({
        "title": item['title'],
        "link": item['link'],
        "date": item['pubDate']
    })

# Ensure the data directory exists
data_directory = "data"
if not os.path.exists(data_directory):
    os.makedirs(data_directory)

# Write the JSON data to your Hugo project's data directory
with open(os.path.join(data_directory, "medium_articles.json"), "w") as f:
    json.dump(articles, f, indent=2)


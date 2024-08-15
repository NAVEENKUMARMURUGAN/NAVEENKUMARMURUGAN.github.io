import requests
import json

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

# Write the JSON data to your Hugo project's data directory
with open("data/medium_articles.json", "w") as f:
    json.dump(articles, f, indent=2)

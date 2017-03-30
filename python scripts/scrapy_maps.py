import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.http import Request

class MapsSpider(scrapy.Spider):
	name = 'jvectormap'
	start_urls = ['http://jvectormap.com/maps/']


	andrej = 'http://jvectormap.com'

	def parse(self, response):
		for link in response.css('.cat-item a'):
			title = link.css("::text").extract_first()
			href = link.css("::attr(href)").extract_first()

			print self.andrej+href
			request = Request(self.andrej+href,
				callback=self.parseMap, 
				meta={'title': title})
			yield request

	
	def parseMap(self, response):
		title = response.meta['title']
		url = response.css(".panes p a::attr(href)").extract_first()

		print self.andrej+url
		with open("all_maps.txt", "a") as f:
			f.write(title+' |=| '+url+ "\n")
		request = Request(self.andrej+url,
			callback=self.saveMap)
		yield request


		request = Request(self.andrej+url.replace('mill','merc'),
			callback=self.saveMap)
		yield request


	def saveMap(self, response):
		path = response.url.split("/")[-1]
		with open('maps\\'+path, "wb") as f:
			f.write(response.body)

process = CrawlerProcess({
	'USER_AGENT': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)'
})

process.crawl(MapsSpider)
process.start() 
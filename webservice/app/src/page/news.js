import React from 'react';
import _ from 'lodash';
import { IconContext } from "react-icons";

import { Tabs, Tab, Card, CardGroup, CardDeck, Button } from 'react-bootstrap';
import classnames from 'classnames';

import moment from 'moment'

import { parseGetQuery, checkDate, findElement } from "../lib/utils"
import { getNews, getProviders } from 'lib/newswatcher_api_calls'

import 'css/news.css'


export default class News extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'tab_0',
      currentPage: 1,
      data: {},
      providers: null,
      currentCategory: 'all'
    };
  }

  componentDidMount() {
    const queryString = require('query-string');
    const parsed = queryString.parse(this.props.location.search);
    console.log('Parsed Query:')
    console.log(parsed)
		// Load the Data
    getProviders().then(data => {
      let providers = [];
      for(let i=0; i<data.length; i++) {
        if(parsed['sym'] != undefined && data[i]['type'].includes('sym')) {
          providers.push(data[i]);
        }
        else if(parsed['sym'] == undefined && data[i]['type'].includes('general')) {
          providers.push(data[i]);
        }
      }
      console.log("Providers: ");
      console.log(providers);
			this.setState({ providers: providers });

      for(let provider of providers) {
        getNews(parsed.sym, provider['id']).then(data => {
          let providerName = provider["name"]
    			this.setState(prevState => {
            prevState = this.state.data;
            prevState[providerName] = data;
            return {data: prevState}
          });
    		})
      }

		})
	}


  getCategories(data) {
    let ret = new Set([]);
    for (let i = 0; i < data.length; i++) {
      if(data[i].category == null) {
        continue
      }
      ret.add(data[i].category);
    }
    return Array.from(ret);
  }
  renderCategories(categories) {
    let btns = [];
    btns.push((<Button variant="light" key="all_btn" onClick={() => {this.setState({currentCategory: 'all'})}}> Show all</Button>))
    for(let i = 0; i < categories.length; i++) {
      btns.push((
        <Button variant="light" key={categories[i]+'_btn'} onClick={() => {this.setState({currentCategory: categories[i]})}}>{categories[i]}</Button>
      ))
    }
    return (
      <div id="category-container">
        {btns}
      </div>
    );
  }


  renderTabContent(articles) {
    const articleSummaryLength = 400;
    let tabContent = [];
    for(let j = 0; j < articles.length; j++) {
        let article = articles[j];
        let articleSummary = ''
        if(article.summary.length > articleSummaryLength){
          articleSummary = article.summary.substring(0, articleSummaryLength) + '...';
        }
        else {
          articleSummary = article.summary;
        }
        if(this.state.currentCategory == 'all' || article.category == this.state.currentCategory) {
          let articleCard = (
            <Card key={'article_'+j} className='articleCard' bg="light" style={{ width: '18rem' }}>
              {/*<Card.Img variant="top" src="holder.js/100px160" />*/}
              <Card.Body>
                <Card.Title><a href={article.link} target="_blank">{article.title}</a></Card.Title>
                <Card.Text>
                  {articleSummary}
                </Card.Text>
              </Card.Body>
              <Card.Footer>
                <small className="text-muted">{checkDate(article.published)} ago</small>
              </Card.Footer>
            </Card>
          );
          tabContent.push(articleCard);
        }
    }
    return tabContent;
  }



  renderNewsTabs() {
    let tabs = [];
    let tabContent = [];

    if(this.state.providers == null) {
      return (
        <div>
          Loading Providers...
        </div>
      )
    }
    else {
      for(let i = 0; i < this.state.providers.length; i++) {
        let provider = this.state.providers[i];
        let providerData = this.state.data[provider['name']]

        if(typeof providerData == 'undefined') {
          tabs.push((
            <Tab eventKey={'tab_'+i} key={'tab_'+i} title={provider['name']}>
              <div className='article-container'>
                Loading Data...
              </div>
            </Tab>
          ))
        }
        else {
          providerData = providerData[0] // returns as a 1 element array
          let categories = this.getCategories(providerData.articles);
          tabs.push((
            <Tab eventKey={'tab_'+i} key={'tab_'+i} title={provider['name']}>
              {this.renderCategories(categories)}
              <div className='article-container'>
                {this.renderTabContent(providerData.articles)}
              </div>
            </Tab>
          ))
        }
      }
      return tabs
    }
  }


  render() {
    let title = 'News'
    const params = parseGetQuery(this.props.location.search)
    title = title + ' - ' + params.sym;

    return (
      <div>
        <Tabs id="news_tabs" defaultActiveKey={'tab_0'}>
          {this.renderNewsTabs()}
        </Tabs>
      </div>
    );
  }
}

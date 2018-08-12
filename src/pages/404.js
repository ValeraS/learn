import React, { Fragment, PureComponent } from 'react';
import Helmet from 'react-helmet';
import Link from 'gatsby-link';

import './404.css';
import notFoundLogo from '../../static/img/freeCodeCamp-404.svg';
import { quotes } from '../../static/json/quotes.json';

let randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

class RandomQuote extends PureComponent {
  state = {
    show: false
  }

  componentDidMount() {
    /* eslint-disable react/no-did-mount-set-state */
    this.setState({ show: true });
  }

  render() {
    return this.state.show ? (
      <Fragment>
        <p>We couldn't find what you were looking for, but here is a quote:</p>

        <div className='quote-wrapper'>
          <p className='quote'>
            <span>&#8220;</span>
            {randomQuote.quote}
          </p>
          <p className='author'>- {randomQuote.author}</p>
        </div>
      </Fragment>
    ) : null;
  }
}

const NotFoundPage = () => (
  <div className='notfound-page-wrapper'>
    <Helmet title='Page Not Found | freeCodeCamp' />

    <img alt='learn to code at freeCodeCamp 404' src={notFoundLogo} />
    <h1>NOT FOUND</h1>

    <RandomQuote />

    <Link className='btn-curriculum' to='/'>
      View the Curriculum
    </Link>
  </div>
);

export default NotFoundPage;

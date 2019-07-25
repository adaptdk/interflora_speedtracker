import React from 'react';
import { render } from 'react-dom';
import Constants from './Constants';
import Dashboard from './Dashboard';
import Footer from './Footer';
import Loader from './Loader';
import TopBar from './TopBar';
import * as Utils from './Utils';
import 'react-datepicker/dist/react-datepicker.css';
import siteSettings from '../site-settings.json';

const objectPath = require('object-path');
const parseUrl = require('query-string').parse;

require('es6-promise').polyfill();

class App extends React.Component {
  constructor(props) {
    super(props);
    const activeProfile = window.PROFILES.find(profile => profile.active);

    const urlParameters = parseUrl(window.location.search);
    const period = Constants.periods.indexOf(urlParameters.period) > -1 ? urlParameters.period : 'week';

    this.state = {
      loading: true,
      period,
      profile: activeProfile,
      profiles: window.PROFILES,
      results: null,
      tests: window.TESTS,
    };

    this.baseUrl = window.BASE_URL || '';
  }

  componentDidMount() {
    const { period } = this.state;
    const dateRange = Utils.getDateRangeForPeriod(period);
    const { from, to } = dateRange;

    document.title = siteSettings.title;

    this.fetchData(from, to);
  }

  componentDidUpdate(oldProps, oldState) {
    const { period, profile } = this.state;
    if ((oldState.period !== period) || (oldState.profile !== profile)) {
      const dateRange = Utils.getDateRangeForPeriod(period);

      this.fetchData(dateRange.from, dateRange.to);
    }
  }

  fetchData = (dateFrom, dateTo) => {
    const { tests } = this.state;

    const monthFrom = (dateFrom.getFullYear() * 100) + dateFrom.getMonth() + 1;
    const monthTo = (dateTo.getFullYear() * 100) + dateTo.getMonth() + 1;

    const testsForRange = tests.filter(test => (
      (test >= monthFrom) && (test <= monthTo)
    ));

    const queue = testsForRange.map((test) => {
      const { profile } = this.state;
      const year = test.toString().slice(0, 4);
      const month = test.toString().slice(4, 6);

      const path = `${this.baseUrl}/results/${profile.slug}/${year}/${month}.json`;

      return window.fetch(path).then(response => (
        response.json()
      ));
    });

    this.setState({
      loading: true,
    });

    Promise.all(queue).then((resultChunks) => {
      const results = {};

      resultChunks.forEach(({ _r: r, _ts: ts }) => {
        Utils.traverseObject(r, (obj, path) => {
          obj.forEach((item, index) => {
            objectPath.set(results, `${ts[index]}.${path.join('.')}`, item);
          });
        });
      });

      this.setState({
        loading: false,
        results,
      });
    });
  }

  changePeriod = (newPeriod) => {
    this.setState({
      period: newPeriod,
    });

    window.history.pushState(null, null, `?period=${newPeriod}`);
  }

  changeProfile = (newProfile) => {
    this.setState({
      loading: true,
    });

    const { period } = this.state;

    window.history.pushState(null, null, `${this.baseUrl}/${newProfile}/?period=${period}`);
    window.fetch(`${this.baseUrl}/profiles.json`)
      .then(res => res.json())
      .then((profiles) => {
        const profile = profiles.find(profileObj => profileObj.slug === newProfile);

        this.setState({
          loading: false,
          profile,
          tests: profile.tests,
        });
      });
  }

  render() {
    const {
      state,
    } = this;

    const { loading } = state;

    return (
      <div style={siteSettings.colors}>
        <TopBar
          {...state}
        />
        {loading ? <Loader />
          : (
            <Dashboard
              {...state}
              onPeriodChange={this.changePeriod}
              onProfileChange={this.changeProfile}
            />
          )
        }
        <Footer />
      </div>
    );
  }
}

render(<App />, document.getElementById('root'));

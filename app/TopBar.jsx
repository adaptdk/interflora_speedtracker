import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import Logo from './Logo';

const startScheduler = (profile) => {
  const { slug } = profile;
  const url = `https://speedyapi.herokuapp.com/v1/test/adaptdk/adapt_speedtracker/master/${slug}`;

  axios.get(url, {
    params: {
      key: 'kobajers',
    },
  })
    .then((response) => {
      if (response.data.success === true) console.log(`next run at ${new Date(response.data.nextRun)}`);
    })
    .catch((error) => {
      console.log(error);
    });
};

const TopBar = ({ profile }) => (
  <div className="c-TopBar">
    <div className="c-TopBar__inner">
      <Logo width={40} />
      <button type="button" onClick={() => startScheduler(profile)}>Start test</button>
    </div>
  </div>
);


TopBar.propTypes = {
  profile: PropTypes.object.isRequired,
};


export default TopBar;

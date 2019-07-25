import React from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
import Info from './Info';
import Constants from './Constants';

const objectPath = require('object-path');

const Section = ({
  metrics,
  lastResult,
  title,
  id,
  yLabel,
  profile,
  ...props
}) => {
  const budgets = (profile.budgets || []).filter(budget => (metrics.indexOf(budget.metric) !== -1));

  return (
    <div className="c-Section">
      <h3 className="c-Section__title">{title}</h3>

      <div className="c-Section__indicators">
        {metrics.map((metricPath) => {
          const metric = objectPath.get(Constants.metrics, metricPath);
          let value = objectPath.get(lastResult, metricPath);
          if (typeof value !== 'undefined') {
            if (typeof metric.transform === 'function') {
              value = metric.transform(value);
            }

            if (metric.unit) {
              value += metric.unit;
            }
          } else {
            value = '—';
          }

          const info = metric.description ? <Info text={metric.description} /> : null;
          const displayValue = value !== null ? value : '—';

          return (
            <dl key={metric.name} className="c-Indicator">
              <dt className="c-Indicator__key">
                {metric.name}
                {info}
              </dt>
              <dd className="c-Indicator__value">{displayValue}</dd>
            </dl>
          );
        })}

        {budgets.map((budget) => {
          const metric = objectPath.get(Constants.metrics, budget.metric);
          const value = objectPath.get(lastResult, budget.metric);

          let budgetValue = budget.max || budget.min || 0;
          let statusClass = ' c-Indicator--success';

          if ((budget.max && (value > budgetValue))
            || (budget.min && (value < budgetValue))) {
            statusClass = ' c-Indicator--danger';
          }

          if (typeof metric.transform === 'function') {
            budgetValue = metric.transform(budgetValue);
          }

          if (typeof budgetValue !== 'undefined') {
            if (metric.unit) {
              budgetValue += metric.unit;
            }
          } else {
            budgetValue = '—';
          }

          return (
            <dl key={metric.name} className={`c-Indicator${statusClass}`}>
              <dt className="c-Indicator__key">
                {metric.name}
                budget
              </dt>
              <dd className="c-Indicator__value">{budgetValue}</dd>
            </dl>
          );
        })}
      </div>

      <Chart
        {...props}
        id={id}
        budgets={budgets}
        metrics={metrics}
        yLabel={yLabel}
      />
    </div>
  );
};

Section.propTypes = {
  metrics: PropTypes.array.isRequired,
  lastResult: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  yLabel: PropTypes.string.isRequired,
  profile: PropTypes.object.isRequired,
};

export default Section;

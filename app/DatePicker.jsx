import React, { useState } from 'react';
import { addDays } from 'date-fns/esm';
import DatePicker from 'react-datepicker';

const useInput = (value) => {
  const [date, dateChange] = useState(value);

  const handleChange = (e) => {
    dateChange(e);
  };

  return {
    selected: date,
    onChange: handleChange,
  };
};

const SelectDate = () => {
  const start = useInput(addDays(new Date(), 7));

  return (
    <>
      <DatePicker
        {...start}
      />
    </>
  );
};

export default SelectDate;

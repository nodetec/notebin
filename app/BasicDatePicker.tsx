import { useState, useEffect } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import TextField from '@mui/material/TextField'
import { addDays, subDays, getUnixTime } from 'date-fns'

interface BasicDatePicker {
  label: string;
  handleDates: Function;
  since: Number;
  until: Number;
  sinceDate: Date;
  untilDate: Date;
}

const BasicDatePicker = ({
  label,
  handleDates,
  since,
  until,
  sinceDate,
  untilDate,
}: BasicDatePicker) => {
  const minDate = new Date('2020-11-01T00:00:00.000Z');
  const maxDate = new Date().setHours(23, 59, 59, 999);

  const [value, setValue] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      convertDate(value);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [value]);

  const convertDate = (date: any) => {
    let isDatePickerEmpty = false;
    if (date === null) {
      // @ts-ignore
      isDatePickerEmpty = true;
    }

    if (date !== null && Date.prototype.toString.call(date) !== 'Invalid Date' && date >= minDate && date <= maxDate) {
      if (label === 'since') {
        date.setHours(0, 0, 0, 0);
      } else if (label === 'until') {
        date.setHours(23, 59, 59, 999);
      }
      const unixTime = getUnixTime(date);
      handleDates(unixTime, label, date, isDatePickerEmpty);
    } else {
      handleDates(undefined, label, null, isDatePickerEmpty);
    }
  }

  const determineMinDate = () => {
    if (label === 'since') {
      return minDate;
    } else if (label === 'until') {
      if (sinceDate === null) {
        const date = new Date('2020-11-02T23:59:59.999Z');
        return date;
      } else {
        const date = addDays(sinceDate, 1);
        date.setHours(23, 59, 59, 999);
        return date;
      }
    }
  }

  const determineMaxDate = () => {
    if (label === 'until') {
      return maxDate;
    } else if (label === 'since') {
      if (untilDate === null) {
        const date = subDays(new Date(), 1);
        date.setHours(0, 0, 0, 0);
        return date;
      } else {
        const date = subDays(untilDate, 1);
        date.setHours(0, 0, 0, 0);
        return date;
      }
    }
  }

  // @ts-ignore
  const popperSx: SxProps = {
    "& .MuiPaper-root": {
      backgroundColor: "rgb(33 42 55)"
    },
    "& .MuiCalendarPicker-root": {
      backgroundColor: "rgb(33 42 55)"
    },
    "& .MuiPickersCalendarHeader-root": {
      color: "#c9d1d9"
    },
    "& .MuiPickersCalendarHeader-switchViewButton:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .MuiPickersCalendarHeader-label": {
      fontFamily: "Inter var, sans-serif",
      fontSize: "1rem"
    },
    "& .MuiPickersArrowSwitcher-button:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .MuiSvgIcon-root": {
      color: "#c9d1d9"
    },
    "& .MuiDayPicker-weekDayLabel": {
      fontFamily: "Inter var, sans-serif",
      fontSize: "0.75rem",
      color: "#c9d1d9"
    },
    "& .MuiPickersDay-dayWithMargin": {
      color: "#c9d1d9"
    },
    "& .MuiPickersDay-root": {
      fontFamily: "Inter var, sans-serif",
      fontSize: "0.75rem",
      backgroundColor: "rgb(33 42 55)"
    },
    "& .MuiPickersDay-root.Mui-disabled": {
      color: "rgb(159 166 177)"
    },
    "& .MuiButtonBase-root-MuiPickersDay-root:not(.Mui-selected)": {
      border: "1px solid rgb(23 23 23)"
    },
    "& .MuiPickersDay-root:focus.Mui-selected": {
      backgroundColor: "rgb(96 165 250)"
    },
    "& .MuiPickersDay-root:hover.Mui-selected": {
      backgroundColor: "rgb(59 130 246)"
    },
    "& .MuiPickersDay-root:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .PrivatePickersYear-yearButton": {
      fontFamily: "Inter var, sans-serif",
      fontSize: "1rem",
      color: "#c9d1d9"
    },
    "& .PrivatePickersYear-yearButton.Mui-selected:focus": {
      backgroundColor: "rgb(96 165 250)"
    },
    "& .PrivatePickersYear-yearButton.Mui-selected:hover": {
      backgroundColor: "rgb(59 130 246)"
    },
    "& .PrivatePickersYear-yearButton:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .Mui-selected": {
      color: "rgb(23 23 23)",
      backgroundColor: "rgb(96 165 250)",
      border: "1px solid rgb(23 23 23)"
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={value}
        minDate={determineMinDate()}
        maxDate={determineMaxDate()}
        onChange={(newValue) => {
          // @ts-ignore
          setValue(newValue);
        }}
        PopperProps={{
          sx: popperSx
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{
              '.MuiFormLabel-root': { color: "#c9d1d9" },
              '& .MuiFormLabel-root.Mui-focused': { color: "rgb(96 165 250)" },
              '.MuiInputBase-root': {
                backgroundColor: "rgb(33 42 55)",
                border: "1px solid transparent",
                fontFamily: "Inter var, sans-serif",
                transitionProperty: "border-color",
                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDuration: "150ms"
              },
              '.MuiInputBase-root:hover': { border: "1px solid transparent" },
              '& .Mui-focused': { color: "rgb(96 165 250)" },
              '& .MuiInputBase-root.Mui-focused:hover': { border: "1px solid transparent" },
              '.MuiInputBase-input': {
                backgroundColor: "rgb(33 42 55)",
                color: "#c9d1d9",
                padding: "0.75rem 0.75rem",
                fontSize: "1rem"
              },
              '& .Mui-error': { color: "rgb(239 68 68)" },
              '& .MuiInputBase-root.Mui-error:hover': { border: "1px solid transparent" },
              '& .MuiFormLabel-root.Mui-error.Mui-focused': { color: "rgb(239 68 68)" },
              ".MuiInputBase-input[type='tel']:focus": { boxShadow: "0 0 0" },
              '.MuiButtonBase-root': { color: "#c9d1d9", fontSize: "1.5rem" },
            }}
          />
        )}
      />
    </LocalizationProvider>
  )
}

export default BasicDatePicker;

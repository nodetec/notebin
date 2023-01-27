import { useState } from 'react'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import TextField from '@mui/material/TextField'

export default function BasicDatePicker() {
  const [value, setValue] = useState(null)

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
    "& .MuiPickersArrowSwitcher-button:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .MuiSvgIcon-root": {
     color: "#c9d1d9"
    },
    "& .MuiDayPicker-weekDayLabel": {
     color: "#c9d1d9"
    },
    "& .MuiPickersDay-dayWithMargin": {
      color: "#c9d1d9"
    },
    "& .MuiPickersDay-root:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .PrivatePickersYear-yearButton": {
      color: "#c9d1d9"
    },
    "& .PrivatePickersYear-yearButton:hover": {
      backgroundColor: "rgba(96, 165, 250, 0.6)"
    },
    "& .Mui-selected": {
      color: "rgb(23 23 23)",
      backgroundColor: "rgb(96 165 250)",
      border: "1px solid rgb(23 23 23)"
    },
    "& .Mui-selected:hover": {
      backgroundColor: "rgb(59 130 246)"
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label='start'
        value={value}
        onChange={(newValue) => {
          setValue(newValue)
        }}
        PopperProps={{
          sx: popperSx
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{
              '.MuiFormLabel-root': { color: "#c9d1d9" },
              '.MuiInputBase-root': { backgroundColor: "rgb(33 42 55)" },
              '.MuiInputBase-input': { backgroundColor: "rgb(33 42 55)", color: "#c9d1d9" , padding: "0.75rem 0.75rem" },
              '.MuiButtonBase-root': { color: "#c9d1d9" },
            }}
          />
        )}
      />
    </LocalizationProvider>
  )
}

import React, { useState } from 'react'
import Snackbar from '@mui/material/Snackbar'
import MuiAlert, { AlertProps } from '@mui/material/Alert'
import {useAppDispatch, useAppSelector} from "../../app/store";
import {setErrorAC} from "../../app/app-reducer";
import {AlertColor} from "@mui/material/Alert/Alert";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant='filled' {...props} />
})

export function ErrorSnackbar() {
    // const [open, setOpen] = useState(true)
    const error = useAppSelector(store => store.app.error)

    const dispatch = useAppDispatch()

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            // return    //не зает закрывать при клике снаружи. Можно навешать логику для клика по экрану перед закрытием
        }
        // setOpen(false)
        dispatch(setErrorAC(null))
    }

    // const test = (value: any): AlertColor => {                // для изменения цвета алерта
    //     return 'success' | 'info' | 'warning' | 'error'       //для test: severity={test('')}
    //     ... тернарниками проверки
    // }

    return (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleClose}>
            <Alert onClose={handleClose} severity='error' sx={{width: '100%'}}>
                {error} 😠
            </Alert>
        </Snackbar>
    )
}

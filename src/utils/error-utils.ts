import {AppActionsType, setErrorAC, setLoadingStatusAC} from "../app/app-reducer";
import {Dispatch} from "redux";
import {ResponseType} from "../api/todolists-api"
                                                                    //другие поля не протипизировали т.к. нао они не интересуетб взяли то что на до для тип что бы типскрипт понимал
export const handleServerNetworkError = (dispatch: ErrorUtilsDispatchType, error: { message: string }) => {
    dispatch(setErrorAC(error.message))
    dispatch(setLoadingStatusAC('failed'))
}

// generic function
export const handleServerAppError  = <T>(data: ResponseType<T>, dispatch: ErrorUtilsDispatchType) => {
    if (data.messages.length) {
        dispatch(setErrorAC(data.messages[0]))
    } else {
        dispatch(setErrorAC('Some error')) // если бэк не описывает ошибку
    }
    dispatch(setLoadingStatusAC('failed'))
}

type ErrorUtilsDispatchType = Dispatch<AppActionsType>


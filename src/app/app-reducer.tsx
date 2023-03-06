//app-reducer.tsx


export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType,   // !!! status: 'fsdf' as RequestStatusType ошибку не дает !!!
    error: 'SOME ERROR' as null | string
}
    // let b = 'ddd' as 'sss' | null


type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: AppActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        case 'APP/SET-ERROR':
            return {...state, error: action.error}
        default:
            return state
    }
}
export const setLoadingStatusAC = (status: RequestStatusType) => ({type:'APP/SET-STATUS', status} as const)
export const setErrorAC = (error: null | string) => ({type:'APP/SET-ERROR', error} as const)

export type SetLoadingStatusType = ReturnType<typeof setLoadingStatusAC>
export type SetErrorType = ReturnType<typeof setErrorAC>

export type AppActionsType = SetLoadingStatusType | SetErrorType

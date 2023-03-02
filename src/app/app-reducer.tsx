//app-reducer.tsx


export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

const initialState = {
    status: 'idle' as RequestStatusType   // !!! status: 'fsdf' as RequestStatusType ошибку не дает !!!
    // error: null as null | string
}
    // let b = 'ddd' as 'sss' | null


type InitialStateType = typeof initialState

export const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'APP/SET-STATUS':
            return {...state, status: action.status}
        default:
            return state
    }
}
export const setLoadingStatusAC = (status: RequestStatusType) => ({type:'APP/SET-STATUS', status} as const)

export type SetLoadingStatusType = ReturnType<typeof setLoadingStatusAC>

type ActionsType = SetLoadingStatusType

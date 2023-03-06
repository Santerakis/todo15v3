import {
    AddTodolistActionType,
    RemoveTodolistActionType,
    setEntityStatusAC,
    SetTodolistsActionType
} from './todolists-reducer'
import {
    ResponseType,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {setErrorAC, SetErrorType, setLoadingStatusAC, SetLoadingStatusType} from "../../app/app-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import axios, {AxiosError} from "axios";

const initialState: TasksStateType = {}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id !== action.taskId)}
        case 'ADD-TASK':
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case 'ADD-TODOLIST':
            return {...state, [action.todolist.id]: []}
        case 'REMOVE-TODOLIST':
            const copyState = {...state}
            delete copyState[action.id]
            return copyState
        case 'SET-TODOLISTS': {
            const copyState = {...state}
            action.todolists.forEach(tl => {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':
            return {...state, [action.todolistId]: action.tasks}
        default:
            return state
    }
}

// actions
export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setLoadingStatusAC('loading'))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            const action = setTasksAC(tasks, todolistId)
            dispatch(action)
            dispatch(setLoadingStatusAC('succeeded'))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => async (dispatch: Dispatch<ActionsType>) => {
    dispatch(setLoadingStatusAC('loading'))
    try {
        const result = await todolistsAPI.deleteTask(todolistId, taskId)  //если зарезолвится
        if (result.data.resultCode === ResultCore.SUCCEEDED) {
            dispatch(removeTaskAC(taskId, todolistId))
            dispatch(setLoadingStatusAC('succeeded'))
        } else {
            handleServerAppError(result.data, dispatch)
        }
    } catch (e) {
        if (axios.isAxiosError<ErrorCustomType>(e)) {
            const error = e.response ?e.response.data.messages :e.message  // это как типизируем объект с бека который ErrorCustomType
            const error1 = e.response?.data  //У Игната так
            const v_action_kprimeru = error1?.messages
            const error2 = e.response?.data.messages
            handleServerNetworkError(dispatch, e)
        } else {
            console.log('...если ошибка не связана с беком')
        }

    }



    // .then(res => {
    //     const action = removeTaskAC(taskId, todolistId)
    //     dispatch(action)
    //     dispatch(setLoadingStatusAC('succeeded'))
    // })
}

// енамка - тайпскриптовая функция
enum ResultCore {             //енамки для именования меджик чисел, для лучшей читабельности
    SUCCEEDED = 0,            // какое число что означает, когда приходит медж.нам с бэка
    FAILED = 1,
    CAPTCHA = 10
}

///////////пример если с бека приходит на анг, а нам надо рус
enum BUTTON_NAMES {
    name = 'Имя',
    number = 'Число'
}

const result = 'name'
const string = BUTTON_NAMES[result]

const data = {
    key: 'name'
} as const

const string2 = BUTTON_NAMES[data.key]
////////////////


export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch<ActionsType>) => {
    dispatch(setLoadingStatusAC('loading'))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {   //лучше (res.data.resultCode === ResultCore.SUCCEEDED)
                const task = res.data.data.item
                const action = addTaskAC(task)
                dispatch(action)
                dispatch(setLoadingStatusAC('succeeded'))
            } else {              // то бы сделать динамическое подставление типов - надо использовать джин. функцию
                handleServerAppError<{ item: TaskType }>(res.data, dispatch) //<{ item: TaskType }> излишне это уточнение
            }                                   // т.к. это уточнение делается динамически в момент вызова функции
        })                           // это явная типизация, для читабельности
        .catch((e) => {
            handleServerNetworkError(dispatch, e)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch<ActionsType>, getState: () => AppRootStateType) => {

        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        dispatch(setLoadingStatusAC('loading'))
        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {     //ResultCode.SECCEEDED
                    const action = updateTaskAC(taskId, domainModel, todolistId)
                    dispatch(action)
                    dispatch(setLoadingStatusAC('succeeded'))
                } else {
                    if (res.data.messages.length) {
                        dispatch(setErrorAC(res.data.messages[0]))
                    } else {
                        dispatch(setErrorAC('Some error')) // если бэк не описывает ошибку
                    }
                    dispatch(setLoadingStatusAC('failed'))
                }

            })                                     //network ошибки
            .catch((e: AxiosError<ErrorCustomType>) => {            //диспатч, который приходит в санку (из замыкания)
                const error = e.response ? e.response.data.messages[0] : e.message
                handleServerNetworkError(dispatch, e)
            })                              //e.response.data.message -ошибка е бека(res-необ. поле) или
                                            //e.message -network(axios) ошибка (mes-всегда, но если бек вернул ошибку то пустым будет(оно ляжет в res))
    }
type ErrorCustomType = {          //back object error  протипиз чтобы типскр подсказывал
    messages: string[]             //будет лежать в response.data
    fielError: string
}

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}
type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistsActionType
    | ReturnType<typeof setTasksAC>
    | SetLoadingStatusType
    | SetErrorType

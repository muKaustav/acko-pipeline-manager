export const sourceTypes = process.env.REACT_APP_SOURCE_TYPES
    ? process.env.REACT_APP_SOURCE_TYPES.split(',')
    : ['mysql', 'postgresql', 'json', 'csv']

export const destinationTypes = process.env.REACT_APP_DESTINATION_TYPES
    ? process.env.REACT_APP_DESTINATION_TYPES.split(',')
    : ['mysql', 'postgresql', 'csv']
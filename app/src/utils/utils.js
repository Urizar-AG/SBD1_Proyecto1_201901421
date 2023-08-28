import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

export const readFile = function (path) {
    const fileContent = readFileSync(path, 'utf-8')
    const csvContent = parse(fileContent)
    csvContent.shift()
    return csvContent
}

export const dateFormat = function (date) {
    return date.split('/').reverse().join('-')
}

export const dateTimeFormat = function (dateTime) {
    const [date, time] = dateTime.split(' ')
    return [dateFormat(date), time.padStart(5, '0')].join(' ').concat(':00')
}

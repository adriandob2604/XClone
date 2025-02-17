interface DateInfo {
    months: string[],
    days: number[],
    years: number[]
}

export function RegisterDateInfo(): DateInfo {
    const isLeapYear = (): boolean => {
        const year = new Date().getFullYear()
        if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) return true
        return false
    }
    const monthsDays = {January: 31, February: isLeapYear() ? 28 : 29, March: 31, April: 30, May: 31, June: 30, July: 31, August: 31, September : 30, October: 31, November: 30, December: 31}
    const years = Array.from({length: 120}, (_, i) => (new Date().getFullYear() - length) + i)
    return {months: Object.keys(monthsDays), days: Object.values(monthsDays), years: years}
}

const chalk = require('chalk')
module.exports = function logIt(value, isError = false){
    if (isError){
        console.log(chalk.red("--> ") + value)
    }else{
        console.log(chalk.green("--> ") + value)
    }
}
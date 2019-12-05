const moment = require('moment')


module.exports = app =>{
    const getTasks = (req, res) =>{
        const date = req.query.date ? req.query.date
            : moment().endOf('day').toDate()

        console.log(req.user.id)

        app.db('tasks')
            .where({ userId: req.user.id })
            .where('estimateAt', '<=', date)
            .orderBy('estimateAt')
            .then(tasks => req.json(tasks))
            .catch(_=> res.status(500).json("ERRO GET"))
    }

    const save = (req, res) => {
        if(!req.body.desc.trim()) {
            return res.status(400).send('Descrição é um campo obrigatório!')
        }

        req.body.userId = req.user.id

        app.db('tasks')
            .insert(req.body)
            .then(_=> res.status(204).send())
            .catch(_=> res.status(400).json("ERRO NO INSERT"))
    }

    const remove = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .del()
            .then(rowsDeleted =>{
                if(rowsDeleted > 0) {
                    res.status(204).send()
                }else{
                    const msg = `Não foi encontrada task com id ${req.params.id}.`
                    res.status(400).send(msg)
                }
            })
            .catch(err => res.status(400).json(err))
    }

    const updateTaskDoneAt = (req, res, doneAt) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .update({ doneAt })
            .then(_=> res.status(204).send())
            .catch(err => res.status(400).json(err))
    }

    const toggleTask = (req, res) => {
        app.db('tasks')
            .where({ id: req.params.id, userId: req.user.id })
            .first()
            .then(task => {
                if(!task) {
                    const msg = `Task com id ${req.params.id}`
                    return res.status(400).send(msg)
                }
                
                const doneAt = task.doneAt ? null : new Date()
                updateTaskDoneAt(req, res, doneAt)
            })
            .catch(err => res.status(400).json(err))
    }

    return { getTasks, save, remove, toggleTask }
}
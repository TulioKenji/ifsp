const getUserController = (req, res) => {
  const {id} = req.params
    res.json({
      id: +id,
      message: "user page",
      user: "tulio",
      email:"tulio.y",
      avatar: "https://github.com/tuliokenji.png"
    })
  }

export default getUserController
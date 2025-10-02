const postUserController = (req, res) => {
    res.json({
      message: "usuario criado",
      user: "tulio",
      email:"tulio.y",
      avatar: "https://github.com/tuliokenji.png"
    })
  }

export default postUserController
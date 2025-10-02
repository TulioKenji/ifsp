const putUserController = (req, res) => {
    res.json({
      message: "usuario atualizado",
      user: "tulioky",
      email:"tulio.ky",
      avatar: "https://github.com/tuliokenji.png"
    })
  }

export default putUserController
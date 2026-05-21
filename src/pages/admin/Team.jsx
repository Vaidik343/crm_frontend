import React, { useEffect, useState } from 'react'
import { useTeam } from './../../context/TeamContext';
import Alert from './../../components/ui/Alert';



const initForm = {
    name: "",
    description: ""
}

const Team = () => {
    const {teams, loading, setTeams, createTeam, getAllTeams, getTeamById, updateTeam, deleteTeam} = useTeam();
    const [form, setForm] = useState(initForm);


    useEffect(() => {
        getAllTeams?.();
    }, []);


    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value}) 
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if(!form.name)
        {
            Alert("Please Enter Team Name");
        }
        return
    }

    const payload = {
        name : form.name,
        description : form.description
    }

    const t = await createTeam(payload)

  return (
    <div></div>
  )
}

export default Team
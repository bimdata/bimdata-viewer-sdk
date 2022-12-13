import { REFLECT_CLIENT_ID, TIPEE_SMARTY_URL } from "./config.js";

function createService() {
  let accessToken = null;
  const setAccessToken = token => (accessToken = token);
  const getAccessToken = () => accessToken;

  function login(username, password) {
    return fetch(`${TIPEE_SMARTY_URL}/oauth/token`, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({
        client_id: REFLECT_CLIENT_ID,
        grant_type: "password",
        username,
        password,
        scopes: "notifications",
      }),
    }).then(
      res => res.json()
    );
  }
  
  async function getProjects() {
    try {
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/projects`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }).then(
        res => res.json()
      );
    } catch (error) {
      console.error("[ReflectPlugin] getProjects error: ", error);
    }
  }
  
  async function getRules(projectId) {
    try {
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/rules?projectId=${projectId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }).then(
        res => res.json()
      ).then(
        json => json.data
      );
    } catch (error) {
      console.error("[ReflectPlugin] getRules error: ", error);
    }
  }

  async function getProperties(projectId, type) {
    try {
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/project/${projectId}/properties?ifc_type=${type}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }).then(
        res => res.json()
      ).then(
        json => json[0].pset_qto
      );
    } catch (error) {
      console.error("[ReflectPlugin] getProperties error: ", error);
    }
  }
  
  async function createProject(name, description = "") {
    try {
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/project`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      }).then(
        res => res.json()
      );
    } catch (error) {
      console.error("[ReflectPlugin] createProject error: ", error);
    }
  }
  
  async function deleteProject(projectId) {
    try {
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/project/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("[ReflectPlugin] deleteProject error: ", error);
    }
  }
  
  async function addIfc(projectId, filename, url) {
    try {
      const data = new FormData();
      data.append("filename", filename);
      data.append("url", url);
  
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/project/${projectId}/add_ifc_bimdata`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: data,
      }).then(
        res => res.json()
      );
    } catch (error) {
      console.error("[ReflectPlugin] addIfc error: ", error);
    }
  }
  
  async function getTaskStatus(projectId, taskId) {
    try {
      return await fetch(`${TIPEE_SMARTY_URL}/reflect/project/${projectId}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }).then(
        res => res.json()
      ).then(
        task => task.task_status
      );
    } catch (error) {
      console.error("[ReflectPlugin] getTaskStatus error: ", error);
    }
  }

  async function runPackage(projectId) {
    try {
      return await fetch(
        `${TIPEE_SMARTY_URL}/reflect/project/${projectId}/package`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: "" }),
        }
      ).then(
        res => res.json()
      );
    } catch (error) {
      console.error("[ReflectPlugin] runPackage error: ", error);
    }
  }

  async function runQuery(projectId, queryBuilder) {
    try {
      return await fetch(
        `${TIPEE_SMARTY_URL}/reflect/project/${projectId}/rule`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(queryBuilder),
        }
      ).then(
        res => res.json()
      );
    } catch (error) {
      console.error("[ReflectPlugin] runQuery error: ", error);
    }
  }

  return {
    setAccessToken,
    getAccessToken,
    login,
    getProjects,
    getRules,
    getProperties,
    createProject,
    deleteProject,
    addIfc,
    getTaskStatus,
    runPackage,
    runQuery,
  };
}


const service = createService();

export default service;

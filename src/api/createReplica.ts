export interface CreateReplicaRequest {
  train_video_url: string;
  replica_name: string;
  callback_url?: string;
}

export interface ReplicaResponse {
  replica_id: string;
  status: string;
  created_at: string;
  replica_name: string;
  train_video_url: string;
}

export const createReplica = async (
  token: string,
  replicaData: CreateReplicaRequest
): Promise<ReplicaResponse> => {
  const response = await fetch("https://tavusapi.com/v2/replicas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token,
    },
    body: JSON.stringify(replicaData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Replica creation failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to create replica: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Replica created:", data);
  return data;
};

export const getReplica = async (
  token: string,
  replicaId: string
): Promise<ReplicaResponse> => {
  const response = await fetch(`https://tavusapi.com/v2/replicas/${replicaId}`, {
    method: "GET",
    headers: {
      "x-api-key": token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Get replica failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get replica: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data;
};

export const listReplicas = async (token: string): Promise<ReplicaResponse[]> => {
  const response = await fetch("https://tavusapi.com/v2/replicas", {
    method: "GET",
    headers: {
      "x-api-key": token,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`List replicas failed: ${response.status} - ${errorText}`);
    throw new Error(`Failed to list replicas: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.replicas || [];
};
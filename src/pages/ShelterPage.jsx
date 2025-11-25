import { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { useParams } from "react-router-dom";

export default function ShelterPage() {
  const { id } = useParams(); // user id (admin id)
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    const loadShelter = async () => {
      const { data: s } = await supabase
        .from("shelters")
        .select("*")
        .eq("admin_user_id", id)
        .maybeSingle();

      setShelter(s);

      if (s) {
        const { data: pets } = await supabase
          .from("animals")
          .select("*")
          .eq("shelter_id", s.id);

        setAnimals(pets);
      }
    };

    loadShelter();
  }, [id]);

  if (!shelter) return <div className="text-white p-6">No shelter found</div>;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">{shelter.name}</h1>

      <h2 className="text-xl font-semibold mb-2">Animals</h2>

      {animals.length === 0 ? (
        <p>No animals yet.</p>
      ) : (
        animals.map((a) => (
          <div key={a.id} className="border p-3 mb-2 rounded bg-white/10">
            {a.title}
          </div>
        ))
      )}
    </div>
  );
}

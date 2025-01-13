<?php

namespace App\Http\Controllers;

use App\Models\Users;
use App\Models\Departement;
use App\Models\Cohorte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use League\Csv\Reader;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    // Lister tous les utilisateurs
    public function list(Request $request)
    {
        $role = $request->query('role');
        $query = Users::query();

        if ($role) {
            $query->where('role', $role);
        }

        $users = $query->get();
        return response()->json($users);
    }

    // Créer un utilisateur
    public function create(Request $request)
    {
        // Validation des données
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'telephone' => 'required|string|size:9',
            'adresse' => 'nullable|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'role' => 'required|in:employe,apprenant',
            'departement_id' => 'nullable|string|exists:departements,_id',
            'cohorte_id' => 'nullable|string|exists:cohortes,_id',
            'cardID' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Générer le matricule
        $matricule = $this->generateMatricule($request->role);
        $data = $request->all();
        $data['matricule'] = $matricule;
        $data['status'] = 'active'; // Ajouter le statut par défaut

        // Ajouter explicitement cardID comme null s'il n'est pas renseigné
        $data['cardID'] = $request->has('cardID') ? $request->cardID : null;

        // Si le rôle est employe, affecter le département et nullifier la cohorte
        if ($request->role === 'employe') {
            $data['cohorte_id'] = null;
        }

        // Si le rôle est apprenant, affecter la cohorte et nullifier le département
        if ($request->role === 'apprenant') {
            $data['departement_id'] = null;
        }

        // Gérer le téléchargement de la photo
        if ($request->hasFile('photo')) {
            $photo = $request->file('photo');
            $photoName = time() . '.' . $photo->getClientOriginalExtension();
            // Vérification du dossier 'photos' et création si nécessaire
            if (!Storage::exists('public/photos')) {
                Storage::makeDirectory('public/photos');
            }
            $photo->storeAs('public/photos', $photoName);
            $data['photo'] = 'photos/' . $photoName;
        }

        // Créer l'utilisateur
        try {
            $user = Users::create($data);
            return response()->json($user, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la création de l\'utilisateur: ' . $e->getMessage()], 500);
        }
    }

    // Créer un utilisateur à partir d'un département
    public function createFromDepartement(Request $request, $departement_id)
    {
        $departement = Departement::find($departement_id);
        if (!$departement) {
            return response()->json(['message' => 'Département non trouvé'], 404);
        }
        $request->merge(['departement_id' => $departement_id, 'role' => 'employe']);
        return $this->create($request);
    }

    // Créer un utilisateur à partir d'une cohorte
    public function createFromCohorte(Request $request, $cohorte_id)
    {
        $cohorte = Cohorte::find($cohorte_id);
        if (!$cohorte) {
            return response()->json(['message' => 'Cohorte non trouvée'], 404);
        }
        $request->merge(['cohorte_id' => $cohorte_id, 'role' => 'apprenant']);
        return $this->create($request);
    }

    // Voir un utilisateur spécifique
    public function view($id)
    {
        $user = Users::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        return response()->json($user);
    }

    // Mettre à jour un utilisateur
    public function update(Request $request, $id)
    {
        $user = Users::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Validation des données
        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $id,
            'telephone' => 'sometimes|required|string|max:20',
            'adresse' => 'nullable|string',
            'photo' => 'nullable|string',
            'role' => 'sometimes|required|in:employe,apprenant',
            'departement_id' => 'nullable|string|exists:departements,_id',
            'cohorte_id' => 'nullable|string|exists:cohortes,_id',
            'cardID' => 'nullable|string',
            'status' => 'sometimes|required|in:active,blocked',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 400);
        }

        // Mettre à jour l'utilisateur
        try {
            $user->update($request->all());
            return response()->json($user, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la mise à jour: ' . $e->getMessage()], 500);
        }
    }

    // Supprimer un utilisateur
    public function delete($id)
    {
        $user = Users::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        try {
            $user->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur lors de la suppression: ' . $e->getMessage()], 500);
        }
    }

    // Générer un matricule
    private function generateMatricule($role)
    {
        $prefix = ($role === 'employe') ? 'EMP' : 'APP';
        $lastUser = Users::where('role', $role)->orderBy('created_at', 'desc')->first();
        $lastNumber = $lastUser ? (int)substr($lastUser->matricule, 3) : 0;
        $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        return $prefix . $newNumber;
    }

    // Récupérer les informations d'un utilisateur par son ID
    public function getUserById($id)
    {
        $user = Users::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        return response()->json($user);
    }
}

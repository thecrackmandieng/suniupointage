<?php 
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;

class Users extends Model implements AuthenticatableContract
{
   use Authenticatable;

   protected $connection = 'mongodb';
   protected $collection = 'users';

   protected $fillable = [
        'nom', 'prenom', 'email', 'telephone', 'adresse', 'photo', 'role', 'departement_id', 'cohorte_id', 'cardID', 'matricule'
    ];


   protected $hidden = [
       'remember_token',
   ];
}
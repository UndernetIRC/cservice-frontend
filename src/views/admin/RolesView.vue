<template>
  <div class="roles-view">
    <div class="roles-header">
      <h2>Role Management</h2>
      <button class="btn-primary" @click="showModal = true">Create Role</button>
    </div>

    <div v-if="loading" class="loading">Loading roles...</div>
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    <div v-else class="roles-list">
      <div v-for="role in roles" :key="role.id" class="role-card">
        <div class="role-info">
          <h3>{{ role.name }}</h3>
          <p class="description">{{ role.description }}</p>
        </div>
        <div class="role-actions">
          <button class="btn-secondary" @click="handleEdit(role)">Edit</button>
          <button class="btn-danger" @click="handleDelete(role)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ editingRole ? 'Edit Role' : 'Create Role' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">Name</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              placeholder="Enter role name"
            />
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              required
              placeholder="Enter role description"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary">
              {{ editingRole ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiService from '@/services/api'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '@/types/api'

const roles = ref<Role[]>([])
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const editingRole = ref<Role | null>(null)

const formData = ref<CreateRoleRequest>({
  name: '',
  description: '',
})

const fetchRoles = async () => {
  loading.value = true
  error.value = ''
  try {
    roles.value = await apiService.getRoles()
  } catch {
    error.value = 'Failed to fetch roles'
  } finally{
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    if (editingRole.value) {
      const updateData: UpdateRoleRequest = {
        name: formData.value.name,
        description: formData.value.description,
      }
      await apiService.updateRole(editingRole.value.id, updateData)
    } else {
      await apiService.createRole(formData.value)
    }
    await fetchRoles()
    closeModal()
  } catch {
    error.value = 'Failed to save role'
  }
}

const handleEdit = (role: Role) => {
  editingRole.value = role
  formData.value = {
    name: role.name,
    description: role.description,
  }
  showModal.value = true
}

const handleDelete = async (role: Role) => {
  if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
    try {
      await apiService.deleteRole(role.id)
      await fetchRoles()
    } catch {
      error.value = 'Failed to delete role'
    }
  }
}

const closeModal = () => {
  showModal.value = false
  editingRole.value = null
  formData.value = {
    name: '',
    description: '',
  }
}

onMounted(fetchRoles)
</script>

<style scoped>
.roles-view {
  padding: 1rem;
}

.roles-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.roles-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.roles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.role-card {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.role-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.description {
  color: #666;
  margin: 0 0 1rem 0;
}

.role-actions {
  display: flex;
  gap: 0.5rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  background-color: #fff;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #999;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.loading,
.error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #dc3545;
}
</style>

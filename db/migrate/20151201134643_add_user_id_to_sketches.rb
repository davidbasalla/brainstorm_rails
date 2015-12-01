class AddUserIdToSketches < ActiveRecord::Migration
  def change
    add_column :sketches, :user_id, :integer
  end
end

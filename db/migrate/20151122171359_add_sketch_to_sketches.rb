class AddSketchToSketches < ActiveRecord::Migration
  def change
    add_column :sketches, :node_data, :json
  end
end

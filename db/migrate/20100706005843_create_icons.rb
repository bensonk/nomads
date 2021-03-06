class CreateIcons < ActiveRecord::Migration
  def self.up
    create_table :icons do |t|
      t.string :name
      t.text :description

      t.timestamps
    end
  end

  def self.down
    drop_table :icons
  end
end
